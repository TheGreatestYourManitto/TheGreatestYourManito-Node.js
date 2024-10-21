import { BaseError } from "../../common/base-error.js";
import { responseStatus } from "../../common/response-status.js";
import { tempResponseDTO } from "../dto/temp-response-dto.js";

export const getTempData = () => {
    return tempResponseDTO("THIS IS EXAMPLE");
};

export function checkFlag(flag) {
    if (flag == 1) {
        throw new BaseError(responseStatus.NOT_SUPPORTED_URI_ERROR);
    }
    else {
        return flagResponseDTO(flag);
    }
}