import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
  ) {}

  findByUser(userId: number) {
    return this.profilesRepo.find({ where: { userId } });
  }

  create(userId: number, data: { name: string; age: number; passcode?: string }) {
    const profile = this.profilesRepo.create({
      userId,
      profile_name: data.name,
      age_group: data.age,
      passcode: data.passcode,
    });
    return this.profilesRepo.save(profile);
  }

  async verifyPasscode(profileId: number, passcode: string) {
    const profile = await this.profilesRepo.findOne({ where: { id: profileId } });
    if (!profile) return { valid: false };
    const valid = profile.passcode === passcode;
    return { valid };
  }
  async findOne(id: number) {
  return this.profilesRepo.findOne({ where: { id } });
}

}
