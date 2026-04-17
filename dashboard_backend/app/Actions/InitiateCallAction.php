<?php

namespace App\Actions;

use App\Enums\{CallDirection, CallStatus};
use App\Jobs\InitiateLiveKitCall;
use App\Models\Agent;


class InitiateCallAction
{
    public function execute(array $data): array
    {
        $agent = Agent::findOrFail($data['agent_id']);

        $phoneNumber = $agent->phoneNumber()->first();

        if (!$phoneNumber) {
            return [
                'success' => false,
                'message' => 'Agent has no phone number configured',
            ];
        }

        $call = $agent->calls()->create([
            'phone_number_id' => $phoneNumber->id,
            'to_number' => $data['to_number'],
            'from_number' => $phoneNumber->did,
            'direction' => CallDirection::OUTBOUND->value,
            'status' => CallStatus::INITIATED->value,
        ]);

        // Dispatch the job to call the external service
        InitiateLiveKitCall::dispatch(
            callId: $call->id,
            agentId: $agent->id,
            toNumber: $data['to_number'],
            contactName: $data['contact_name'],
            phoneNumberDid: $phoneNumber->did,
            providerConfig: $phoneNumber->provider_config ?? [],
        );

        return [
            'success' => true,
            'call_id' => $call->id,
            'message' => 'Call initiated successfully',
        ];
    }
}
