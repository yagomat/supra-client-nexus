
export interface WebhookData {
  event?: string;
  instance?: string;
  data?: any;
  destination?: string;
  server_url?: string;
  apikey?: string;
}

export interface BulkMessageData {
  campaignId: string;
  targetFilter: {
    status?: string;
    servidor?: string;
    uf?: string;
  };
  messageContent: string;
  sendIntervalMin?: number;
  sendIntervalMax?: number;
}

export interface TemplateMessageData {
  templateId: string;
  clienteId: string;
  customData?: Record<string, any>;
}

export interface AutoResponseData {
  message: string;
  fromPhone: string;
}

export interface ScheduleRemindersData {
  // No additional data needed for now
}
