import { Extension } from "../domain-exceptions";

export type ErrorResponseBody = {
  errorsMessages: Extension[];
};
