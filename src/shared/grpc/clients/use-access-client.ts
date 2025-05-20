import { PhotoMetaAccessServiceDefinition } from "../../proto/photometa_backend_access/v1/photometa_backend_access";
import { useGrpcClient } from "../use-grpc-client";

export const useAccessClient = () => {
  return useGrpcClient(PhotoMetaAccessServiceDefinition);
};
