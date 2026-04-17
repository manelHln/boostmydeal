<?php

namespace App\Jobs;

use App\Enums\CallStatus;
use App\Models\Agent;
use App\Models\Call;
use App\Models\Notification;
use App\Models\PhoneNumber;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InitiateLiveKitCall implements ShouldQueue
{
    use Dispatchable, Queueable;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public string $callId,
        public string $agentId,
        public string $toNumber,
        public string $contactName,
        public string $phoneNumberDid,
        public array $providerConfig
    ) {
        $this->onQueue('calls');
    }

    public function handle(): void
    {
        $call = Call::find($this->callId);
        $agent = Agent::find($this->agentId);

        if (!$call) {
            Log::error('[InitiateLiveKitCall] Call not found', ['call_id' => $this->callId]);
            return;
        }

        if (!$agent) {
            Log::error('[InitiateLiveKitCall] Agent not found', ['agent_id' => $this->agentId]);
            Notification::addNewNotification(
                title: 'Call Initiation Failed',
                type: 'call_failure',
                body: "Failed to initiate call to {$this->toNumber} because the agent was not found."
            );
            $call->update(['status' => CallStatus::UNKNOWN->value]);
            return;
        }

        $phoneNumber = PhoneNumber::find($call->phone_number_id);

        if (!$phoneNumber) {
            Log::error('[InitiateLiveKitCall] Phone number not found', ['phone_number_id' => $call->phone_number_id]);
            Notification::addNewNotification(
                title: 'Call Initiation Failed',
                type: 'call_failure',
                body: "Failed to initiate call to {$this->toNumber} because the phone number was not found."
            );
            $call->update(['status' => CallStatus::UNKNOWN->value]);
            return;
        }

        $payload = $this->preparePayload($agent, $call, $phoneNumber);

        Log::info('[InitiateLiveKitCall] Sending call request', [
            'call_id' => $call->id,
            'to_number' => $this->toNumber,
            'contact_name' => $this->contactName,
        ]);

        $apiUrl = config('services.livekit.url');

        if (!$apiUrl) {
            Log::error('[InitiateLiveKitCall] LiveKit URL not configured');
            Notification::addNewNotification(
                title: 'Call Initiation Failed',
                type: 'call_failure',
                body: "Failed to initiate call to {$this->toNumber} because the call service is not configured properly."
            );
            $call->update(['status' => CallStatus::UNKNOWN->value]);
            return;
        }

        $apiKey = config('services.livekit.api_key');

        try {
            $response = Http::timeout(60)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-API-Key' => $apiKey,
                    'X-Request-ID' => Str::uuid()->toString(),
                ])
                ->post($apiUrl . '/calls/outbound', $payload);

            if ($response->successful()) {
                $responseData = $response->json();

                if (isset($responseData['call_id'])) {
                    $externalCallId = $responseData['call_id'];
                    $roomName = $responseData['room_name'] ?? null;

                    $call->update([
                        'status' => CallStatus::IN_PROGRESS,
                        'livekit_room' => $roomName,
                        'from_number' => $phoneNumber->did,
                    ]);

                    Log::info('[InitiateLiveKitCall] Call initiated successfully', [
                        'call_id' => $call->id,
                        'external_call_id' => $externalCallId,
                        'room_name' => $roomName,
                    ]);

                    Notification::addNewNotification(
                        title: 'Call Initiated',
                        type: 'call_initiated',
                        body: "Call to {$this->toNumber} has been initiated successfully."
                    );
                } else {
                    Log::error('[InitiateLiveKitCall] No call_id in response', ['response' => $responseData]);
                    Notification::addNewNotification(
                        title: 'Call Initiation Failed',
                        type: 'call_failure',
                        body: "Failed to initiate call to {$this->toNumber} because the call service did not return a valid response."
                    );
                    $call->update(['status' => CallStatus::UNKNOWN->value]);
                }
            } else {
                Log::error('[InitiateLiveKitCall] API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                Notification::addNewNotification(
                    title: 'Call Initiation Failed',
                    type: 'call_failure',
                    body: "Failed to initiate call to {$this->toNumber} because the call service returned an error."
                );
                $call->update(['status' => CallStatus::UNKNOWN->value]);
            }
        } catch (\Exception $e) {
            Log::error('[InitiateLiveKitCall] Exception occurred', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            Notification::addNewNotification(
                title: 'Call Initiation Failed',
                type: 'call_failure',
                body: "Failed to initiate call to {$this->toNumber} due to a connection error."
            );
            $call->update(['status' => CallStatus::UNKNOWN->value]);

            throw $e;
        }
    }

    private function preparePayload(Agent $agent, Call $call, PhoneNumber $phoneNumber): array
    {
        $now = now();
        $previousCallSummary = $this->getPreviousCallSummary($this->toNumber, $this->agentId);

        // Build comprehensive agent prompt from all personality fields
        $promptParts = [];
        if ($agent->identity) {
            $promptParts[] = $agent->identity;
        }
        if ($agent->style) {
            $promptParts[] = "Communication Style: " . $agent->style;
        }
        if ($agent->goal) {
            $promptParts[] = "Goal: " . $agent->goal;
        }
        if ($agent->response_guideline) {
            $promptParts[] = "Response Guidelines: " . $agent->response_guideline;
        }
        if ($agent->fallback) {
            $promptParts[] = "Fallback Responses: " . $agent->fallback;
        }
        if (!empty($previousCallSummary) && $previousCallSummary !== "No previous call history with this contact.") {
            $promptParts[] = "Previous Call Context: " . $previousCallSummary;
        }

        $agentPromptPreamble = implode("\n\n", $promptParts);

        return [
            'to_phone' => $this->toNumber,
            'from_phone' => $phoneNumber->did,
            'contact_name' => $this->contactName,

            // Agent identity and behavior
            'agent_initial_message' => $agent->first_message ?? "Hello! How can I assist you today?",
            'agent_prompt_preamble' => $agentPromptPreamble,
            'user_speak_first' => (bool) ($agent->user_speaks_first ?? false),
            'mode' => $agent->mode ?? 'pipeline',

            // LLM configuration
            'llm_provider' => $agent->llm_provider,
            'llm_model' => $agent->llm_model ?? 'gpt-4o-mini',
            'temperature' => (float) ($agent->temperature ?? 0.7),
            'language' => $agent->language ?? 'en',
            'agent_speed' => 1.0,

            // TTS configuration
            'tts' => [
                'provider_name' => $agent->tts_provider ?? 'cartesia',
                'voice_id' => $agent->tts_voice ?? '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
                'model_id' => $agent->tts_provider ?? 'sonic-3',
            ],

            // STT configuration
            'stt' => [
                'provider_name' => $agent->stt_provider ?? 'deepgram',
                'model' => $agent->stt_model ?? 'nova-2',
            ],

            // Model configuration
            'model' => [
                'name' => $agent->llm_model ?? 'gpt-4o-mini',
            ],

            // Features
            'agent_generate_responses' => true,
            'enable_vad' => (bool) ($agent->enable_vad ?? true),
            'enable_interruptions' => (bool) ($agent->enable_interruptions ?? true),
            'recording' => (bool) ($agent->call_recording ?? true),
            'recording_format' => $agent->recording_format ?? 'mp3',
            'recording_expiration_days' => 30,
            'voicemail' => false,
            'voicemail_message' => $agent->voicemail_message ?? '',
            'enable_call_transfer' => (bool) ($agent->enable_human_transfer ?? false),
            'transfer_phone_number' => '',
            'enable_background_sound' => (bool) ($agent->enable_background_sound ?? false),
            'background_sound' => $agent->background_sound ?? '',
            'remember_lead_preference' => (bool) ($agent->remember_lead_preference ?? false),
            'use_knowledge_base' => true,
            'knowledge_base_top_k' => 3,

            // Context
            'current_date' => $now->format('l, F j, Y'),
            'current_time' => $now->format('h:i:s A'),
            'previous_call_summary' => $previousCallSummary,

            // Webhook
            'webhook_url' => config('services.livekit.webhook_url'),

            // Tags
            'user_tags' => [],
            'system_tags' => [],
        ];
    }

    private function getPreviousCallSummary(string $toNumber, string $agentId): string
    {
        try {
            $previousCalls = Call::where('to_number', $toNumber)
                ->where('agent_id', $agentId)
                ->whereIn('status', [CallStatus::COMPLETED->value, CallStatus::ANSWERED->value])
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get(['id', 'status', 'duration_seconds', 'created_at']);

            if ($previousCalls->isEmpty()) {
                return "No previous call history with this contact.";
            }

            $summaries = $previousCalls->map(function ($call) {
                $date = $call->created_at?->format('M j, Y');
                $duration = $call->duration_seconds ?? 0;
                return "[{$date}, Duration: {$duration}s]";
            })->toArray();

            return "Previous call history with {$toNumber}:\n" . implode("\n", $summaries);
        } catch (\Exception $e) {
            Log::error('[InitiateLiveKitCall] Error fetching previous calls', [
                'message' => $e->getMessage(),
            ]);
            return "No previous call history with this contact.";
        }
    }

    private function getProviderApiKey(?string $provider): ?string
    {
        return match (strtolower($provider ?? '')) {
            'openai' => config('services.openai.api_key'),
            'deepgram' => config('services.deepgram.api_key'),
            'elevenlabs', 'eleven_labs' => config('services.elevenlabs.api_key'),
            'rime' => config('services.rime.api_key'),
            'streamelements', 'stream_elements' => config('services.streamelements.api_key'),
            'smallest ai', 'smallest_ai' => config('services.smallest_ai.api_key'),
            default => config('services.deepgram.api_key'),
        };
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[InitiateLiveKitCall] Job failed', [
            'call_id' => $this->callId,
            'message' => $exception->getMessage(),
        ]);

        $call = Call::find($this->callId);
        if ($call) {
            Notification::addNewNotification(
                title: 'Call Initiation Failed',
                type: 'call_failure',
                body: "Failed to initiate call to {$this->toNumber} due to a job processing error."
            );
            $call->update(['status' => CallStatus::UNKNOWN->value]);
        }
    }
}
