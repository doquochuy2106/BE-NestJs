import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUsers } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class CompaniesService {

  constructor(@InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>) { }

  async create(createCompanyDto: CreateCompanyDto, user: IUsers) {
    let company = await this.companyModel.create({
      name: createCompanyDto.name,
      address: createCompanyDto.address,
      description: createCompanyDto.description,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return company
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUsers) {
    let companyUpdate = await this.companyModel.updateOne({ _id: id }, {
      name: updateCompanyDto.name,
      address: updateCompanyDto.address,
      description: updateCompanyDto.description,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })

    return companyUpdate
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs)
    delete filter.page;
    delete filter.limit

    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const result = await this.companyModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec()

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }



  async remove(id: string, user: IUsers) {
    await this.companyModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })

    return await this.companyModel.softDelete({
      _id: id
    })

  }
}
