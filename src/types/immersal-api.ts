const immersalLocalizeURL = "https://api.immersal.com/localizeb64";

interface SDKMapId {
  id: number;
}

interface ImmersalLocalizeRequest {
  token: string,
  fx: number;
  fy: number;
  ox: number;
  oy: number;
  b64: string;
  mapIds: SDKMapId[];
}

interface ImmersalLocalizeResponse {
  error: string,
  success?: boolean;
  map?: number;
  px?: number;
  py?: number;
  pz?: number;
  r00?: number;
  r01?: number;
  r02?: number;
  r10?: number;
  r11?: number;
  r12?: number;
  r20?: number;
  r21?: number;
  r22?: number;
}

export {
  immersalLocalizeURL,
  ImmersalLocalizeRequest,
  ImmersalLocalizeResponse,
};
