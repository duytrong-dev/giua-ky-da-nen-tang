import * as Crypto from "expo-crypto";

export const hashPassword = async (password: string) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export const comparePassword = async (password: string, hash: string) => {
  const newHash = await hashPassword(password);
  return newHash === hash;
};


