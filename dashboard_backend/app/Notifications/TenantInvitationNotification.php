<?php

namespace App\Notifications;

use App\Models\TenantInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenantInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public TenantInvitation $invitation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tenant = tenant();
        $url = config('app.frontend_url').'/accept-invitation?token='.$this->invitation->token;

        return (new MailMessage)
            ->subject("Invitation to join {$tenant->name}")
            ->greeting('Hello!')
            ->line("You have been invited to join {$tenant->name} as a {$this->invitation->role}.")
            ->action('Accept Invitation', $url)
            ->line('This invitation will expire in 7 days.')
            ->line('If you did not expect this invitation, no further action is required.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'invitation_id' => $this->invitation->id,
            'email' => $this->invitation->email,
            'role' => $this->invitation->role,
        ];
    }
}
