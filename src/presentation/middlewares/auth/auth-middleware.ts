import { HttpRequest, HttpResponse, Middleware } from '../../protocols'
import { forbidden } from '../../helpers/http/http-helpers'
import { AccessDeniedError } from '../../errors'

export class AuthMiddleware implements Middleware {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const error = forbidden(new AccessDeniedError())
    return Promise.resolve(error)
  }
}