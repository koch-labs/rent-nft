# Harberger NFT

## NFT Standard

### Objectives

#### Minimizing accounts size

One of the big down side of Metaplex Standard is that it tries to cover a scope that is too large, making you pay on each mint for informations you will never use.
Reducing mandatory account size to the minimum will make minting much cheaper and will still be compatible with account compression.

#### Maximizing account reusability

Having to create complex scripts that will require access to the update authority private keys is bad: non technicals will have to pay a dev, devs will do repetitive work, it also makes some use cases harder to realize.
Giving the opportunity to modify many tokens in a single tx thanks to reflected changes favorizes account reusability.

#### Simple Programmability

Using user created Token2022 tokens for representing NFTs enables many new ownership models, especially with delegation.

#### Flexible set inclusions

One of the most important feature of NFT is to prove you're part of something and that your participation is uniquely identified. For example, owning a MadLad not only proves you're part of the MadLad owners community, you have a very specific MadLad that no one else has.

In this standard, all tokens are potential sets that can recursively contain other sets.
Modifying a set will require a new kind of authority, the _Inclusion Authority_.
However, anyone will be able to prove that a token is part of a superset.

This allows creating sets of collections, where each collection grants a specific right, on top of the common rights granted by all collections.

### Accounts

#### **Metadata**

Uniquely identified by the mint of the token it represents.

It maintains a version number that is incremented for every set operation of this token (When this token includes other tokens in its set, not when other tokens include it).

Data:

- **index**. Mint of the token
- Current authorities group
- Set Version Counter.
- Set Size
- Pointer to the actual metadata.

#### **AuthoritiesSet**

Uniquely identified by a random ID.

Data:

- **index**. ID
- Public key of the inclusion authority
- Public key of the update authority

#### **SetInclusion**

Uniquely identified by the parent metadata and the child metadata.
Can only be created by the Inclusion Authority.
Does not need to store the version because they don't become stale since they're created by the Inclusion Authority.

Data:

- **index**. Public key of the parent set metadata
- **index**. Public key of the child metadata

#### **SupersetInclusion**

Uniquely identified by the parent metadata and the child metadata.
They need to maintain the counter because these accounts can be created by anyone, generally the token holder.

Data:

- **index**. Public key of the parent set metadata
- **index**. Public key of the child metadata
- Last seen Set Version Counter

### Instructions

#### CreateAuthoritiesGroup

#### UpdateAuthoritiesGroup

Only the update authority of an authorities group can update it

#### CreateMetadata

#### UpdateMetadata

Only the update authority of the metadata authorities group can update it

#### BurnMetadata

Only the update authority of the metadata authorities group can burn it.
Requires the burning metadata set size to 0.

#### IncludeMetadata

Only the inclusion authority of the parent metadata's authorities group can include

#### ExcludeMetadata

Only the inclusion authority of the parent metadata's authorities group can exclude

#### CreateSupersetInclusion

#### CloseSupersetInclusion

## Rent NFT
