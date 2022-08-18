###### tags: `taisys`

# Staking Contract Document

- [addWhitelist](#addWhitelist)<span style="color:red">\*transaction</span>
- [removeWhitelist](#removeWhitelist)<span style="color:red">\*transaction</span>
- [updatePeriod](#updatePeriod)<span style="color:red">\*transaction</span>
- [setPeriodThreshold](#setPeriodThreshold)<span style="color:red">\*transaction</span>
- [setRewardingAddress](#setRewardingAddress)<span style="color:red">\*transaction</span>
- [addLevel](#addLevel)<span style="color:red">\*transaction</span>
- [setPendingGovernance](#setPendingGovernance)<span style="color:red">\*transaction</span>
- [acceptGovernance](#acceptGovernance)<span style="color:red">\*transaction</span>
- [claim](#claim)<span style="color:red">\*transaction</span>
- [exit](#exit)<span style="color:red">\*transaction</span>
- [getPeriodCount](#getPeriodCount)
- [getPeriod](#getPeriod)
- [getPeriodThreshold](#getPeriodThreshold)
- [getRewardingAddress](#getRewardingAddress)
- [getLevelCount](#getLevelCount)
- [getLevel](#getLevel)
- [canClaim](#canClaim)
- [getPoolToken](#getPoolToken)
- [getPoolTotalDeposited](#getPoolTotalDeposited)
- [getStakeTotalDeposited](#getStakeTotalDeposited)
- [getStakeInfo](#getStakeInfo)
- [getAllTokens](#getAllTokens)



## Type Reference

- [TransactionResponse](https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse)
- [BigNumber](https://docs.ethers.io/v5/api/utils/bignumber/)
- [Result](https://docs.ethers.io/v5/api/utils/abi/interface/#Result)

<br />

---

<br />

## `addWhitelist`

Adds a whitelist contract to staking contoract.

### Format

```javascript
.addWhitelist(whitelist)
```
### Input

> whitelist: `Whitelist`

### Output

> none

### Event

> `WhitelistAdded(whitelist: Whitelist)`

<br />

[Back To Top](#staking-contract-document)

---

## `removeWhitelist`

Removes a whitelist contract from staking contoract.

### Format

```javascript
.removeWhitelist(whitelist)
```
### Input

> whitelist: `Whitelist`

### Output

> none

### Event

> `WhitelistRemoved(whitelist: Whitelist)`

<br />

[Back To Top](#staking-contract-document)

---

## `updatePeriod`

Updates the time period for each interest payment. (becomes valid after the current period ends)

### Format

```javascript
.updatePeriod(period)
```

### Input

> period: `uint256`

### Output

> none

### Event

> `PeriodUpdated(period: uint256, updateTime: uint256)`

<br />

[Back To Top](#staking-contract-document)

---

<br />

## `setPeriodThreshold`

Sets the amount of period a user has to wait to claim his interest. (becomes valid after the current period ends)

### Format

```javascript
.setPeriodThreshold(periodThreshold)
```

### Input

> periodThreshold: `uint256`

### Output

> none

### Event

> `PeriodThresholdUpdated(periodThreshold)`

<br />

[Back To Top](#staking-contract-document)

---

<br />

## `setRewardingAddress`

Sets the address which pays interest reward to deposits.

### Format

```javascript
.setRewardingAddress(rewardingAddress)
```

### Input

> rewardingAddress: `address`

### Output

> none

### Event

> `RewardAddressUpdated(rewardAddress: address)`

<br />

[Back To Top](#staking-contract-document)

---

<br />

## `addLevel`

Updates the interest a bounded deposit (lowerBound <= deposit < upperBound) can get for every period.

### Format

```javascript
.addLevel(interest, lowerBound, upperBound)
```

### Input

> - interest: `uint256`
> - lowerBound: `uint256`
> - upperBound: `uint256`

### Output

> none

### Event

> `LevelAdded(interest: uint256, lowerBound: uint256, upperBound: uint256, currentPeriod: uint256)`

[Back To Top](#staking-contract-document)

---

<br />

## `setPendingGovernance`

Sets the new pending governance.

### Format

```javascript
.setPendingGovernance(pendingGovernance)
```

### Input

> - pendingGovernance: `address`

### Output

> none

### Event

> `PendingGovernanceUpdated(pendingGovernance: address)`

<br />

[Back To Top](#staking-contract-document)

---

<br />

## `acceptGovernance`

Accepts to be the new governance.

### Format

```javascript
.acceptGovernance()
```

### Input

> none

### Output

> none

### Event

> `GovernanceUpdated(pendingGovernance: address)`

<br />

[Back To Top](#staking-contract-document)

## `deposit`

Deposits an amount of token to the target pool.

### Format

```javascript
.deposit(depositAmount)
```
### Input

> depoistAmount: `uint256`

### Output

> none

### Event

> `TokenDeposited(sender: address, amount: uint256)`

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `claim`

Claims the interest yields from the deposit.

If the claiming amount is more than the interest, it claims all.

### Format

```javascript
.claim(claimAmount)
```

### Input

> claimAmount: `uint256`

### Output

> none

### Event

> `TokenClaimed(claimer: address, amount: uint256)`

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `exit`

Withdraw the deposit along with all its interest.

### Format

```javascript
.exit()
```

### Input

> none

### Output

> none

### Event

> `TokensWithdrawn(withdrawer: address, amount: uint256)`

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getPeriodCount`

Gets the total period added in the staking contract.

### Format

```javascript
.getPeriodCount()
```

### Input

> none

### Output

> `Promise<BigNumber>`: the total period added in the staking contract.

* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getPeriod`

Gets the time period for each interest payment.

### Format

```javascript
.getPeriod(n)
```

### Input

> n: `uint256` - the index to the period

### Output

> `Promise<BigNumber>`: the `${n}`-th period added to the staking contract.
> 
* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getPeriodThreshold`

Gets the amount of period a user has to wait to claim his interest.

### Format

```javascript
.getPeriodThreshold()
```

### Input

> none

### Output

> `Promise<BigNumber>`: the period threshold.

* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getRewardingAddress`

Gets the address which pays interest reward to deposits.

### Format

```javascript
.getRewardingAddress()
```

### Input

> none

### Output

> `Promise<string>`: The address which pays interest reward to deposits.

* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getLevelCount`

Gets number of levels defining the interest.

### Format

```javascript
.getLevelCount()
```

### Input

> none

### Output

> `Promise<BigNumber>`: the number of levels defining the interest

* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getLevel`

Gets the target level defining the interest.

### Format

```javascript
.getLevel(n)
```

### Input

> n: `uint256` - the level index to be looked up

### Output

> `Promise<Result>`:
> - `interest: BigNumber`: the interest of the level
> - `lowerBound: BigNumber`: the lower bound value of the level
> - `upperBound: BigNumber`: the upper bound value of the level
> - `updatePeriod: BigNumber`: the period when the level is updated

* [BigNumber](#Type-Reference)
* [Result](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `canClaim`

True if the deposit is deposited long enough to claim the interest yeilds.

### Format

```javascript
.canClaim(account, poolId)
```

### Input

> account: `address` - the target account

### Output

> `Promise<boolean>`

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getPoolToken`

Gets the ERC20 token address of the staking contract.

### Format

```javascript
.getPoolToken()
```

### Input

> none

### Output

> `Promise<string>`: the ERC20 token address of the staking contract

<br />

[Back To Top](#staking-contract-document)

## `getPoolTotalDeposited`

Gets the total deposit of the staking contract.

### Format

```javascript
.getPoolTotalDeposited()
```

### Input

> none

### Output

> `Promise<BigNumber>`: the total deposit of the staking contract

* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getStakeTotalDeposited`

Gets the total deposit for the target account in the staking contract.

### Format

```javascript
.getStakeTotalDeposited(account)
```

### Input

> account: `address`

### Output

> `Promise<BigNumber>`: the total deposit of `${account}`

* [BigNumber](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getStakeInfo`

Gets the info(total deposit, total interest by far, last deposit/claim period, and the first deposit period) of the target account in the target staking pool.

### Format

```javascript
.getStakeInfo(account)
```

### Input

> account: `address`

### Output

> `Promise<Result>`
> - `totalDeposited: BigNumber`: total deposit of `${account}`
> - `totalInterest: BigNumber`: total claimable interest of `${account}`
> - `lastUpdatePeriod: BigNumber`: last deposit/claim/exit period of `${account}` 
> - `depositPeriod: BigNumber`: last deposit period of `${account}`

* [BigNumber](#Type-Reference)
* [Result](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)

___

<br />

## `getAllTokens`

Gets all NFT tokens the target owner has.

### Format

```javascript
.getAllTokens(owner)
```

### Input

> owner: `address`

### Output

```
[
  BigNumber { _hex: '0x02', _isBigNumber: true },
  BigNumber { _hex: '0x01', _isBigNumber: true },
  BigNumber { _hex: '0x03', _isBigNumber: true },
  BigNumber { _hex: '0x00', _isBigNumber: true }
]
```
The output above indicates `whitelist[0]` has `2` tokens, which are 1 and 3. `whitelist[1]` has `0` token.

> `Promise<Result>`
> - `n: BigNumber`: different NFT tokenId owned by `${owner}`. The first number, say `2`, indicates the following two numbers are tokenId owned by `${owner}` from `whitelist[0]`. The next number, in this case, the fourth number, is the count of tokens of the next whitelist. Followed by tokenIds.

* [BigNumber](#Type-Reference)
* [Result](#Type-Reference)

<br />

[Back To Top](#staking-contract-document)
