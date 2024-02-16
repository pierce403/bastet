These contracts manage the NFT collection and the USDC vault for Bastet.

# BastetCrystal

Standard ERC-1155 contract with some extra onlyOwner mods to tweak the URI, the allowed minter, and the valut. This contract is also the source of truth for approved orgs under the protection of Bastet.

https://polygonscan.com/address/0xbe39df1e59651aef996a280b4d4212ed7b807784

# BastetCave

This is the cave of Bastet, which controls how crystals get minted. This may switch around a lot early on as new models of NFT distribution are experimented with. Not currently deployed.

# BastetVault

This is the where the funds get collected. For the most part, funds should come in through the tribute function, and exit through the blessings function, and all funds at rest should be stored as cUSDC, which is USDC staked in the Compount v3 staking contract. This contract will also start with emergency functions for rescuing funds sent to it incorrectly, and an emergency mode to exit the USDC being used as the principal (which should not be accessible via blessings). Not currently deployed.
