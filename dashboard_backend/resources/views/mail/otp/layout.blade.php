<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ config('app.name') }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #fff7ed;
            color: #333333;
            line-height: 1.6;
            padding: 20px;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .email-header {
            color: #ffffff;
            padding: 30px 40px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        
        .email-header p {
            font-size: 14px;
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .content {
            font-size: 15px;
            color: #4a5568;
            margin-bottom: 20px;
        }
        
        .content p {
            margin-bottom: 15px;
        }
        
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .email-header {
                padding: 20px;
            }
            
            .otp-code .code {
                font-size: 32px;
                letter-spacing: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
      
        
        <div class="email-body">
            @yield('content')
        </div>
        
        <div class="footer">
            <p><strong>© 2026 Boostmydeal.</strong></p>
        </div>
    </div>
</body>
</html>