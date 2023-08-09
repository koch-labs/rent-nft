# Harberger NFT

## NFT Standard

We propose a new implementation for NFT Metadata.

We observe that Metaplex's dominant token metadata implementation has the following characteristics:

- Expensive to mint because of the size and number of accounts needed.
- Overly complex programmable NFTs when Token2022 can do most of the heavy lifting for us already
- Frequent need to do 1tx/NFT to update informations like authorities.
- Only supports metadata stored on external storage.

We propose an alternative with these characteristics instead:

- Minimal metadata accounts.
  - As the most basic account, getting rid of superfluous data is important. The functions that we need are 1) easily composable minting 2) checking if the token is part of a set, 3) efficiently updating its metadata and 2). This translates by minimized account dependency for creation operations and unambiguous inclusion information from a single source of truth that is simple to modify
- Token ownership using Token2022.
  - Token2022 can handle many cases of programmable ownership using its delegation feature. Tokens can be easily created and configured using other tools and they can be composed using reusable authority accounts.
- Reusable accounts
  - By creating reusable authorities and having metadata point to them, we only need to modify the authority, not every token that had this authority. Because authorities are composable and rely on token ownership, we can easily configure complex collections without the need to create custom programs.
- A simple interface for a wide range of storage
  - Onchain metadata have a interesting properties that cannot be used with Metaplex
  - Reusing other tokens metadata let's tokens reflect changes made at a single point.

### Accounts

#### **AuthorityNode**

#### **AuthoritiesSet**

#### **Metadata**

## Rent NFT
