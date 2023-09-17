export type RentNft = {
  "version": "0.1.0",
  "name": "rent_nft",
  "constants": [
    {
      "name": "DEPOSITS_SEED",
      "type": "string",
      "value": "\"deposits\""
    },
    {
      "name": "TREASURY_SEED",
      "type": "string",
      "value": "\"treasury\""
    },
    {
      "name": "COLLECTION_AUTHORITY_SEED",
      "type": "string",
      "value": "\"collection\""
    },
    {
      "name": "SECONDS_PER_YEAR",
      "type": "u64",
      "value": "31536000"
    }
  ],
  "instructions": [
    {
      "name": "createCollection",
      "docs": [
        "Initializes a collection from an existing metadata",
        "The metadata update authority will be transfered to the collection"
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "taxMint",
          "type": "publicKey"
        },
        {
          "name": "taxRate",
          "type": "u64"
        },
        {
          "name": "minPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateCollection",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "taxRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "minPrice",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "uri",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "contentHash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "receiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The mint of the new token"
          ]
        },
        {
          "name": "tokenMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata of the token"
          ]
        },
        {
          "name": "inclusion",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Proof of inclusion"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The account storing the new token"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The wrapper"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "currentAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "contentHash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "tokenState",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "increaseBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "taxMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The token used to pay taxes"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositorAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "decreaseBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "taxMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The token used to pay taxes"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The mint of the token"
          ]
        },
        {
          "name": "newOwnerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldOwnerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerBidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "buyToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The mint of the token"
          ]
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerBidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerBidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newSellPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawTax",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The token to withdraw"
          ]
        },
        {
          "name": "adminAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "taxTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "collectionConfig",
      "docs": [
        "A group contains all the parameters required to compute taxes.",
        "It's used to save space in each token account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collectionMint",
            "docs": [
              "The collection mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "taxMint",
            "docs": [
              "The mint of the tax token"
            ],
            "type": "publicKey"
          },
          {
            "name": "taxRate",
            "docs": [
              "Basis points per year of tax on the selling price"
            ],
            "type": "u64"
          },
          {
            "name": "minimumSellPrice",
            "type": "u64"
          },
          {
            "name": "collectedTax",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "The collection config"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint of the token"
            ],
            "type": "publicKey"
          },
          {
            "name": "ownerBidState",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "deposited",
            "docs": [
              "The sum of all deposits"
            ],
            "type": "u64"
          },
          {
            "name": "currentSellingPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bidState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenState",
            "docs": [
              "The token state"
            ],
            "type": "publicKey"
          },
          {
            "name": "bidder",
            "docs": [
              "The owner of the deposit"
            ],
            "type": "publicKey"
          },
          {
            "name": "lastUpdate",
            "docs": [
              "Timestamp of the last update"
            ],
            "type": "i64"
          },
          {
            "name": "amount",
            "docs": [
              "The amount deposited"
            ],
            "type": "u64"
          },
          {
            "name": "sellingPrice",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CollectionCreated",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "taxMint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TokenCreated",
      "fields": [
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedBidState",
      "fields": [
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "BidAmountChanged",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdatedBid",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidState",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "BoughtToken",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrewFees",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OwnZero",
      "msg": "Admin should own at least one token"
    },
    {
      "code": 6001,
      "name": "NoAuthority",
      "msg": "User does not have the authority"
    },
    {
      "code": 6002,
      "name": "InvalidTokenStatePeriod",
      "msg": "Invalid token state period"
    },
    {
      "code": 6003,
      "name": "InvalidBidStatePeriod",
      "msg": "Invalid bid state period"
    },
    {
      "code": 6004,
      "name": "BadPreviousOwner",
      "msg": "Invalid owner bid state passed"
    },
    {
      "code": 6005,
      "name": "NotEnoughDeposited",
      "msg": "Owner bid state does not have enough deposited, token should return to minimum price"
    },
    {
      "code": 6006,
      "name": "OutOfDateBid",
      "msg": "Owner bid state needs to be updated"
    },
    {
      "code": 6007,
      "name": "InsufficientBid",
      "msg": "Needs a bigger amount to bid"
    }
  ]
};

export const IDL: RentNft = {
  "version": "0.1.0",
  "name": "rent_nft",
  "constants": [
    {
      "name": "DEPOSITS_SEED",
      "type": "string",
      "value": "\"deposits\""
    },
    {
      "name": "TREASURY_SEED",
      "type": "string",
      "value": "\"treasury\""
    },
    {
      "name": "COLLECTION_AUTHORITY_SEED",
      "type": "string",
      "value": "\"collection\""
    },
    {
      "name": "SECONDS_PER_YEAR",
      "type": "u64",
      "value": "31536000"
    }
  ],
  "instructions": [
    {
      "name": "createCollection",
      "docs": [
        "Initializes a collection from an existing metadata",
        "The metadata update authority will be transfered to the collection"
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "taxMint",
          "type": "publicKey"
        },
        {
          "name": "taxRate",
          "type": "u64"
        },
        {
          "name": "minPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateCollection",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "taxRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "minPrice",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "uri",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "contentHash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "receiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The mint of the new token"
          ]
        },
        {
          "name": "tokenMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata of the token"
          ]
        },
        {
          "name": "inclusion",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Proof of inclusion"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The account storing the new token"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The wrapper"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "currentAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "collectionMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authoritiesGroup",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "contentHash",
          "type": {
            "option": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "tokenState",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "increaseBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "depositor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "taxMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The token used to pay taxes"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositorAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "decreaseBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bidder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "taxMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The token used to pay taxes"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidderAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The mint of the token"
          ]
        },
        {
          "name": "newOwnerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldOwnerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerBidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "buyToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The mint of the token"
          ]
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerBidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerBidState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newSellPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateBid",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "tokenState",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The state for the token assessement"
          ]
        },
        {
          "name": "bidState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawTax",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The config"
          ]
        },
        {
          "name": "collectionMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The token to withdraw"
          ]
        },
        {
          "name": "adminAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Common Solana programs"
          ]
        },
        {
          "name": "taxTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "collectionConfig",
      "docs": [
        "A group contains all the parameters required to compute taxes.",
        "It's used to save space in each token account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collectionMint",
            "docs": [
              "The collection mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "taxMint",
            "docs": [
              "The mint of the tax token"
            ],
            "type": "publicKey"
          },
          {
            "name": "taxRate",
            "docs": [
              "Basis points per year of tax on the selling price"
            ],
            "type": "u64"
          },
          {
            "name": "minimumSellPrice",
            "type": "u64"
          },
          {
            "name": "collectedTax",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "The collection config"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint of the token"
            ],
            "type": "publicKey"
          },
          {
            "name": "ownerBidState",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "deposited",
            "docs": [
              "The sum of all deposits"
            ],
            "type": "u64"
          },
          {
            "name": "currentSellingPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bidState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenState",
            "docs": [
              "The token state"
            ],
            "type": "publicKey"
          },
          {
            "name": "bidder",
            "docs": [
              "The owner of the deposit"
            ],
            "type": "publicKey"
          },
          {
            "name": "lastUpdate",
            "docs": [
              "Timestamp of the last update"
            ],
            "type": "i64"
          },
          {
            "name": "amount",
            "docs": [
              "The amount deposited"
            ],
            "type": "u64"
          },
          {
            "name": "sellingPrice",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CollectionCreated",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "taxMint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TokenCreated",
      "fields": [
        {
          "name": "config",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CreatedBidState",
      "fields": [
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "BidAmountChanged",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdatedBid",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bidState",
          "type": "publicKey",
          "index": true
        }
      ]
    },
    {
      "name": "BoughtToken",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrewFees",
      "fields": [
        {
          "name": "collection",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OwnZero",
      "msg": "Admin should own at least one token"
    },
    {
      "code": 6001,
      "name": "NoAuthority",
      "msg": "User does not have the authority"
    },
    {
      "code": 6002,
      "name": "InvalidTokenStatePeriod",
      "msg": "Invalid token state period"
    },
    {
      "code": 6003,
      "name": "InvalidBidStatePeriod",
      "msg": "Invalid bid state period"
    },
    {
      "code": 6004,
      "name": "BadPreviousOwner",
      "msg": "Invalid owner bid state passed"
    },
    {
      "code": 6005,
      "name": "NotEnoughDeposited",
      "msg": "Owner bid state does not have enough deposited, token should return to minimum price"
    },
    {
      "code": 6006,
      "name": "OutOfDateBid",
      "msg": "Owner bid state needs to be updated"
    },
    {
      "code": 6007,
      "name": "InsufficientBid",
      "msg": "Needs a bigger amount to bid"
    }
  ]
};
