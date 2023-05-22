import { ContactServiceInterface } from './../Domain/Contact/Service/ContactServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results, httpDelete } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Contact } from '../Domain/Contact/Model/Contact'
import { ContactProjection } from '../Projection/ContactProjection'

@controller('/contacts', TYPES.AuthMiddleware)
export class ContactsController extends BaseHttpController {
  constructor(
    @inject(TYPES.ContactService) private contactService: ContactServiceInterface,
    @inject(TYPES.ContactProjector) private contactProjector: ProjectorInterface<Contact, ContactProjection>,
  ) {
    super()
  }

  @httpPost('/')
  public async createContact(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.contactService.createContact({
      userUuid: response.locals.user.uuid,
      contactUuid: request.body.contact_uuid,
      contactPublicKey: request.body.contact_public_key,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not create contact')
    }

    return this.json({
      contact: this.contactProjector.projectFull(result),
    })
  }

  @httpDelete('/:contactUuid')
  public async deleteContact(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.contactService.deleteContact({
      originatorUuid: response.locals.user.uuid,
      contactUuid: request.params.contactUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not delete contact')
    }

    return this.json({ success: true })
  }

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }
}
