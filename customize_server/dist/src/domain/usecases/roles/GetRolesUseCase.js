"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRolesUseCase = void 0;
class GetRolesUseCase {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async execute(filters) {
        return this.roleRepository.findAll(filters);
    }
}
exports.GetRolesUseCase = GetRolesUseCase;
