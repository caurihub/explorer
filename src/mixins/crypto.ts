import { Identities } from "@cauriland/crypto";

export default {
  methods: {
    addressFromPublicKey(publicKey: string): string {
      return Identities.Address.fromPublicKey(publicKey);
    },
    addressFromMultiSignatureAsset(asset): string {
      return Identities.Address.fromMultiSignatureAsset(asset);
    },
  },
};
