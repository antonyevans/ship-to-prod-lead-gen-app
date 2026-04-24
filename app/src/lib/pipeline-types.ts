export type ProspectStatus =
  | "searching"
  | "found"
  | "no_phone"
  | "skipped";

export type ScriptStatus = "waiting" | "generating" | "ready" | "failed";

export type CallStatus =
  | "waiting"
  | "initiated"
  | "ringing"
  | "answered"
  | "completed"
  | "voicemail"
  | "no-answer"
  | "failed";

export interface Script {
  opener: string;
  pain_hook: string;
  service_pitch: string;
  objection_answer: string;
  cta: string;
}

export interface Prospect {
  index: number;
  name: string;
  phone: string | null;
  website: string | null;
  pain_signal: string | null;
  prospectStatus: ProspectStatus;
  scriptStatus: ScriptStatus;
  callStatus: CallStatus;
  script: Script | null;
}

export type PipelineEvent =
  | { type: "prospect_found"; index: number; name: string; phone: string; website: string }
  | { type: "pain_signal"; index: number; painSignal: string }
  | { type: "script_generating"; index: number }
  | { type: "script_ready"; index: number; script: Script }
  | { type: "script_failed"; index: number }
  | { type: "call_status"; index: number; status: CallStatus }
  | { type: "error"; message: string }
  | { type: "done" };

export interface PipelineConfig {
  run_id: string;
  service: string;
  icp: string;
}
