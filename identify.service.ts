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
    const contacts = await this.contactRepository.find({ where: [{ email }, { phoneNumber }] });

    if (!contacts.length) {
      const newContact = this.contactRepository.create({ email, phoneNumber, linkPrecedence: 'primary' });
      await this.contactRepository.save(newContact);
      return this.formatResponse(newContact, []);
    }

    const primary = contacts.find(c => c.linkPrecedence === 'primary') || contacts[0];

    if (contacts.every(c => c.email !== email || c.phoneNumber !== phoneNumber)) {
      const secondary = this.contactRepository.create({ email, phoneNumber, linkedId: primary.id, linkPrecedence: 'secondary' });
      await this.contactRepository.save(secondary);
    }

    const allContacts = await this.contactRepository.find({ where: { linkedId: primary.id } });
    return this.formatResponse(primary, allContacts.map(c => c.id).filter(id => id !== primary.id));
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
