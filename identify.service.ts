import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class IdentifyService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async identifyContact(email?: string, phoneNumber?: string) {
    const contacts = await this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.email = :email', { email })
      .orWhere('contact.phoneNumber = :phoneNumber', { phoneNumber })
      .getMany();

    if (!contacts.length) {
      const newContact = await this.contactRepository.save({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      return this.formatResponse(newContact, []);
    }

    const primary = contacts.find((c) => c.linkPrecedence === 'primary') || contacts[0];

    if (contacts.every((c) => c.email !== email || c.phoneNumber !== phoneNumber)) {
      await this.contactRepository.save({
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: 'secondary',
      });
    }

    const allContacts = await this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.linkedId = :linkedId OR contact.id = :linkedId', { linkedId: primary.id })
      .getMany();

    return this.formatResponse(primary, allContacts.map((c) => c.id).filter((id) => id !== primary.id));
  }

  private formatResponse(primary: Contact, secondaryIds: number[]) {
    return {
      contact: {
        primaryContactId: primary.id,
        emails: [primary.email],
        phoneNumbers: [primary.phoneNumber],
        secondaryContactIds: secondaryIds,
      },
    };
  }
}
