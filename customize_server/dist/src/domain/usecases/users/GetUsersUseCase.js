"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersUseCase = void 0;
class GetUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(filters) {
        return await this.userRepository.findAll(filters);
    }
}
exports.GetUsersUseCase = GetUsersUseCase;
