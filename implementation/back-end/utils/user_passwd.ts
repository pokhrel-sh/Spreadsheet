import bcrypt from "bcrypt";

/**
 * Hashes the password
 * @param password user password
 * @returns hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/**
 * Compares the password with the hash
 * @param password user password
 * @param hash hashed password
 * @returns if the password is correct
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
