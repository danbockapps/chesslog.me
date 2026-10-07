import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {buildAuthorizeUrl, buildRedirectUri, codeChallenge, normalizeEmail} from './lichessOAuth'

describe('codeChallenge', () => {
  it('matches the RFC 7636 S256 test vector', () => {
    expect(codeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    )
  })
})

describe('buildAuthorizeUrl', () => {
  const original = process.env.LICHESS_CLIENT_ID
  beforeEach(() => {
    process.env.LICHESS_CLIENT_ID = 'https://chesslog.me'
  })
  afterEach(() => {
    process.env.LICHESS_CLIENT_ID = original
  })

  it('sets the PKCE and scope params', () => {
    const url = new URL(
      buildAuthorizeUrl({
        redirectUri: 'https://chesslog.me/auth/lichess/callback',
        state: 'abc',
        codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      }),
    )
    expect(url.origin + url.pathname).toBe('https://lichess.org/oauth')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'https://chesslog.me',
      redirect_uri: 'https://chesslog.me/auth/lichess/callback',
      scope: 'email:read',
      state: 'abc',
      code_challenge_method: 'S256',
      code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    })
  })

  it('throws when LICHESS_CLIENT_ID is unset', () => {
    delete process.env.LICHESS_CLIENT_ID
    expect(() => buildAuthorizeUrl({redirectUri: 'x', state: 's', codeVerifier: 'v'})).toThrow(
      'LICHESS_CLIENT_ID',
    )
  })
})

describe('buildRedirectUri', () => {
  it('prefers forwarded headers', () => {
    const headers = new Headers({
      'x-forwarded-host': 'chesslog.me',
      'x-forwarded-proto': 'https',
      host: '0.0.0.0:3000',
    })
    expect(buildRedirectUri(headers, 'http://0.0.0.0:3000')).toBe(
      'https://chesslog.me/auth/lichess/callback',
    )
  })

  it('falls back to host, then to the fallback origin', () => {
    expect(buildRedirectUri(new Headers({host: 'localhost:3002'}), 'http://x')).toBe(
      'http://localhost:3002/auth/lichess/callback',
    )
    expect(buildRedirectUri(new Headers(), 'http://fallback')).toBe(
      'http://fallback/auth/lichess/callback',
    )
  })
})

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Foo@Example.COM ')).toBe('foo@example.com')
  })
})
