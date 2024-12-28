import { PartialType } from '@nestjs/mapped-types';
import { CreateMoneyboxDto } from './create-moneybox.dto';

export class UpdateMoneyboxDto extends PartialType(CreateMoneyboxDto) {}
