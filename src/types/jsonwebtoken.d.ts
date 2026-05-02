declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number;
    issuer?: string;
    audience?: string | string[];
  }

  export interface VerifyOptions {
    issuer?: string;
    audience?: string | string[];
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string,
    options?: VerifyOptions
  ): string | object;

  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
  };

  export default jwt;
}
