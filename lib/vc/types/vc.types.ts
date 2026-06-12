export interface VerifiableCredential {
  '@context': string | string[];
  id: string;
  type: string | string[];
  issuer: string;
  /** VCDM 2.0 validity start (replaces issuanceDate) */
  validFrom: string;
  /** VCDM 2.0 optional expiry (replaces expirationDate) */
  validUntil?: string;
  credentialSubject: Record<string, any>;
  proof?: {
    type: string;
    created: string;
    proofPurpose?: string;
    verificationMethod: string;
    proofValue?: string;
    [key: string]: any;
  };
}

export interface VerifiablePresentation {
  '@context': string | string[];
  type: string | string[];
  verifiableCredential: any[];
  proof?: any;
}
