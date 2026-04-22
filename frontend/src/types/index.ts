export type ApiMode = "insecure" | "secure";

export type CtfTaskStatus = "coming_soon" | "locked" | "open";

export type CtfDifficulty = "Kolay" | "Orta" | "İleri";

export interface CtfTask {
  id: string;
  title: string;
  description: string;
  /** Kart üzerinde kısa etiket */
  tag: string;
  /** Zafiyet sınıfı (ör. Mass Assignment) */
  vulnerabilityType: string;
  /** İlgili HTTP endpoint veya rota */
  targetEndpoint: string;
  difficulty: CtfDifficulty;
  status: CtfTaskStatus;
  /** Insecure API’de gözlenen / beklenen davranış */
  insecureExpected: string;
  /** Secure API’de gözlenen / beklenen davranış */
  secureExpected: string;
  /** Laboratuvar: görevin öğrenme hedefi */
  goal: string;
  /** Laboratuvar: adım adım veya mantıksal yönlendirme */
  procedure: string;
  /** Laboratuvar: örnek HTTP gövdesi / başlık / yol (metin) */
  exampleRequest: string;
  /** Laboratuvar: görevin tamamlanmış sayılması için ölçüt */
  successCriteria: string;
  /** Laboratuvar: secure implementasyonda savunma gerekçesi */
  whyBlockedOnSecure: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponseBody {
  access_token: string;
  warning?: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
}

export interface RegisterResponseBody {
  message: string;
  warning?: string;
}

export interface ApiErrorBody {
  error?: string;
}

/** GET /users/me yanıtı */
export interface UserMeResponse {
  id: number;
  email: string;
}

/** GET /health yanıtı */
export interface HealthResponse {
  status: string;
  service: string;
}
