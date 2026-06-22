/**
 * Fetch a Lichess study's PGN.
 *
 * Public studies are readable with no authentication, so we request unauthenticated first. This
 * succeeds regardless of whether LICHESS_TOKEN is unset, expired, or simply lacks the study scope —
 * sending a bad token would otherwise make Lichess reject an otherwise-public study (401/403).
 *
 * Only if the unauthenticated request comes back unauthorized (a private study) do we retry with the
 * configured token, which can read private studies owned by the token's account.
 */
export async function fetchLichessStudyPgn(studyId: string): Promise<Response> {
  const url = `https://lichess.org/api/study/${studyId}.pgn`

  const res = await fetch(url)
  if (res.status !== 401 && res.status !== 403) return res

  const token = process.env.LICHESS_TOKEN
  if (!token) return res

  // The first response is unauthorized; drain its body before retrying with auth. We read the body
  // to completion rather than calling res.body.cancel(): under Next.js's instrumented fetch, the
  // stream's cancel() never resolves, which would hang collection creation indefinitely.
  await res.text().catch(() => {})
  return fetch(url, {headers: {Authorization: `Bearer ${token}`}})
}
