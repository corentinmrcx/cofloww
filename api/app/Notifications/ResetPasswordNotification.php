<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = config('app.frontend_url') . "/password-reset/{$this->token}?email=" . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage())
            ->subject($this->subject())
            ->view('emails.reset_password', [
                'url'       => $url,
                'firstname' => $notifiable->firstname,
                'locale'    => app()->getLocale(),
                'expire'    => config('auth.passwords.users.expire', 60),
            ]);
    }

    private function subject(): string
    {
        return app()->getLocale() === 'fr'
            ? 'Réinitialisation de votre mot de passe CoFloww'
            : 'Reset your CoFloww password';
    }
}
