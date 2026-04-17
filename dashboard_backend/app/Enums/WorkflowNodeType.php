<?php

namespace App\Enums;

enum WorkflowNodeType: string
{
    case TRIGGER = 'trigger';
    case AI_AGENT = 'ai_agent';
    case CONDITION = 'condition';
    case EMAIL_TOOL = 'email_tool';
    case HUBSPOT_TOOL = 'hubspot_tool';
    case ZOHO_TOOL = 'zoho_tool';
    case OUTBOUND_CALL = 'outbound_call';
    case WEBHOOK_TOOL = 'webhook_tool';
}
