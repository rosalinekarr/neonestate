import { Auth } from '../hooks/useAuth'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Body = Record<string, any>
type Params = Record<string, string>

export async function buildRequest(auth: Auth, method: HTTPMethod, path: string, bodyOrParams?: Body | Params): Promise<Request> {
	const authToken = await auth()

	const body = method !== 'GET' ? bodyOrParams : null
	const params = method === 'GET' ? bodyOrParams : null

	const url = new URL(path, import.meta.env.VITE_API_BASE_URL)
	for (const param in params) {
		url.searchParams.set(param, encodeURIComponent(params[param]))
	}

	return new Request(
		url,
		{
			...body ? {
				body: JSON.stringify(body),
			} : {},
			headers: new Headers({
				Authorization: `Bearer ${authToken}`,
				...body ? {
					'Content-Type': 'application/json',
				} : {},
			}),
			method,
		},
	)
}