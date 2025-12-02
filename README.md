# Hardhat Tasks

## Available Tasks

### Fiat Token Deployment
Deploy USDC-compatible FiatToken contracts.

```bash
yarn hardhat deploy-fiat-token [--implementation] [--proxy] --network <network_name>
```

**Flags:**
- `--implementation` - Deploy implementation
- `--proxy` - Deploy proxy

**Examples:**
```bash
# Deploy implementation only
yarn hardhat deploy-fiat-token --implementation --network arbitrum

# Deploy complete setup with configuration
yarn hardhat deploy-fiat-token --implementation --proxy --network arbitrum
```

### Configure Fiat Token

```bash
yarn hardhat configure-minter --network <network_name>
```

### Fiat Token Admin Management
Manage FiatToken admin and ownership.

```bash
# Change FiatToken admin
yarn hardhat fiat-token-change-admin --admin <address> --network <network_name>

# Transfer FiatToken ownership
yarn hardhat fiat-token-transfer-ownership --owner <address> --network <network_name>
```

**Examples:**
```bash
# Change admin
yarn hardhat fiat-token-change-admin --admin 0x1234567890123456789012345678901234567890 --network base

# Transfer ownership
yarn hardhat fiat-token-transfer-ownership --owner 0x5678901234567890123456789012345678901234 --network base
```

## Contract Addresses
After deployment, addresses are saved to environment variables:
- `USDC_<NETWORK_NAME>` - FiatToken implementation address
- `USDC_PROXY_<NETWORK_NAME>` - FiatToken proxy address
- `USDC_PROXY_ADMIN_<NETWORK_NAME>` - FiatToken proxy admin address 
