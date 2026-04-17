@extends('mail.otp.layout')

@section('content')
    <h1>Confirm your email address</h1>
    <p>Here’s your confirmation code. You can copy it into the open browser window to complete your login.</p>
    <p>This code will expire in 5 minutes.</p>
    <div class="otp-code">
        <span class="code">{{ $otp }}</span>
    </div>
    <p>If you didn’t request this code, you can safely ignore this email.</p>
@endsection