<?php

return [
    'llm' => [
        'openai' => ['gpt-4o-mini', 'gpt-4.1', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4', 'gpt-4o'],
        'anthropic' => ['claude-3-haiku'],
    ],
    'stt' => [
        'deepgram' => ['nova-2'],
        'openai' => ['whisper-1'],
    ],
    'tts' => ['elevenlabs'],
    'realtime' => [
        'openai' => ['gpt-4o-realtime-preview'],
        'gemini' => ['gemini-3.1-flash-live-preview'],
    ],
];
