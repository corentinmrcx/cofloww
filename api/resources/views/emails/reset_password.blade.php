@php
$isFr = $locale === 'fr';
$strings = $isFr ? [
    'greeting'    => 'Bonjour ' . $firstname . ',',
    'intro'       => 'Vous avez demandé la réinitialisation du mot de passe de votre compte CoFloww.',
    'action'      => 'Réinitialiser mon mot de passe',
    'expire'      => 'Ce lien expire dans ' . $expire . ' minutes.',
    'ignore'      => 'Si vous n\'avez pas effectué cette demande, ignorez simplement cet email — votre mot de passe restera inchangé.',
    'copy_label'  => 'Ou copiez ce lien dans votre navigateur :',
    'footer'      => '© ' . date('Y') . ' CoFloww · Tous droits réservés',
] : [
    'greeting'    => 'Hello ' . $firstname . ',',
    'intro'       => 'You requested a password reset for your CoFloww account.',
    'action'      => 'Reset my password',
    'expire'      => 'This link expires in ' . $expire . ' minutes.',
    'ignore'      => 'If you did not request a password reset, please ignore this email — your password will remain unchanged.',
    'copy_label'  => 'Or copy this link into your browser:',
    'footer'      => '© ' . date('Y') . ' CoFloww · All rights reserved',
];
@endphp
<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{ $strings['action'] }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">

        {{-- Logo / Brand --}}
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;margin-bottom:24px;">
          <tr>
            <td align="center" style="padding:0 0 8px;">
              <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#09090b;">CoFloww</span>
            </td>
          </tr>
        </table>

        {{-- Card --}}
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">

          {{-- Header strip --}}
          <tr>
            <td style="background:#09090b;padding:28px 40px;">
              <p style="margin:0;font-size:13px;font-weight:500;color:#a1a1aa;letter-spacing:0.5px;text-transform:uppercase;">CoFloww</p>
              <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                {{ $isFr ? 'Réinitialisation' : 'Password reset' }}<br>
                {{ $isFr ? 'de mot de passe' : 'request' }}
              </h1>
            </td>
          </tr>

          {{-- Body --}}
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;line-height:1.6;">
                {{ $strings['greeting'] }}
              </p>

              <p style="margin:0 0 28px;font-size:15px;color:#3f3f46;line-height:1.6;">
                {{ $strings['intro'] }}
              </p>

              {{-- CTA Button --}}
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:10px;background:#09090b;">
                    <a href="{{ $url }}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:-0.1px;">
                      {{ $strings['action'] }}
                    </a>
                  </td>
                </tr>
              </table>

              {{-- Expire notice --}}
              <p style="margin:0 0 24px;font-size:13px;color:#71717a;line-height:1.5;">
                ⏱ {{ $strings['expire'] }}
              </p>

              {{-- Divider --}}
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0 0 24px;">

              {{-- Ignore notice --}}
              <p style="margin:0 0 24px;font-size:13px;color:#71717a;line-height:1.6;">
                {{ $strings['ignore'] }}
              </p>

              {{-- Fallback URL --}}
              <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;">{{ $strings['copy_label'] }}</p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;word-break:break-all;background:#f4f4f5;border-radius:6px;padding:10px 12px;">
                {{ $url }}
              </p>

            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f4f4f5;background:#fafafa;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                {{ $strings['footer'] }}
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
