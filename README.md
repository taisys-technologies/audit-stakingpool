# audit-whitelist

The purpose of this contract is to record user NFTs on the other blockchain for `WhitelistChecker.sol`(checker contracts) to perform access control.

Each deployed whtielist records exactly one kind of NFT token.

The following are explanations for some user scenarios and the contract functions.

## Contract Scenario Description

- Checker management

The whitelist contract keeps track of a list of checkers, which check whitelist for access control. A checker can only be added to whitelist by governance. Conversely, a checker can be removed by both the checker contract itself or the governance. The whitelist contract uses the method, `isUsing` in checker contracts to know if any checker is relying its access control on the whitelist contract.

The relative methods are `addChecker`, and `removeChecker`.

- NFT manageement

The whitelist contract relies on an external oracle to synchronize whether users has transfered their NFT token to our contract on the other blockchain. Upon receiveing relative event on the other blockchain, the oracle adds the NFT to the whitelist. Such oracle has to be the governance. On the other hand, only the NFT owner is able to remove an NFT from the whitelist when no checker contracts `isUsing` the NFT. The oracle can then inform the contract on the other blockchain to return the NFT back to the user.

The relative methods are `addNFT`, and `removeNFT`.

## Function Description

- onlyGovernance

Modifier that accepts only transactions from the assigned governance.

</br>

- setPendingGovernance **onlyGovernance**

Sets the pending governance. The governance changes after `acceptPendingGovernance` being called by the set pending governance.

</br>

- acceptGovernance

This method can only be called by the pending governance set by the function, `setPendingGovernance`. The caller becomes the governance.

</br>

- addCheckerk **onlyGovernance**

Adds a checker to the whitelist contract.

</br>

- removeChecker

This contract can be called by both the checker to be removed or the governance. It removes a checker from the whitelist contract.

</br>

- addNFT **onlyGovernance**

Adds an NFT to the whitelist contract.

</br>

- removeNFT

This contract can only be called by the NFT owner. It removes an NFT from the whitelist after making sure no checker contract is relying access control on the NFT.

</br>

- includeOwner

Gets whether any NFT in the whitelist contract belongs to the the owner.

</br>

- balanceOf

Gets the number of NFT(s) the owner has.

</br>

- listTokens

Gets the list of tokens the owner has.

</br>

# audit-stakingPool

The purpose of this contract is to reward whitelisted users to stake assigned ERC20 tokens.

The reward is decided by variables including period, periodThreshold, and level.

The following are explanations for some user scenarios and the contract functions.

## Contract Scenario Description

- Whitelist management

The staking contract keeps track of mulitple whitelist contracts to perform access control with the modifier, `inWhitelist`. To take part in the staking contract, users need to be in at least one of those whitelists. Only the governance has the accessibility to add/remove whitelists to/from the staking contract.

The relative methods are `addWhitelist`, and `removeWhitelist`.

- Rewarding mechanism

The reward of a particular staking amount is rewarded to the user per *period* time passed since the first deposit. For any staking amount, *amount* s.t. *level.lowerBound* ${\le} *amount* < *level.upperBound* gets *level.interest* per period time. When a staking fits in multiple overlapping *level*s stored in the staking contract, the latest fitting one is used.

Even though the reward is accumulated since the first deposit, it can only be claimed after *periodThreshold* of periods since then. In other words, the reward before *periodThreshold* after the first deposit is considered to be 0.

Note that *period*, *periodThreshold*, and *level*s can all be modified overtime by the goverance. Addtional staking amounts from users are also allow. All of them come into effect in the next period of time. Among them, *period*, *level*s, and addtional staking amounts do not work retroactively. Reward already accumulated cannot be changed.

Also note that the reward is not added to the staking. Without user operations, a user staking does not grow overtime.

The relative methods are `updatePeriod`, `setPeriodTreshold`, and `addLevel`.

- Staking process

To participate in a staking process, users has to have at least one NFT in whitelist contracts watched by the staking contract. Besides, a staking amount cannot be staked if it is not bounded in any level.

With staking in the contract, users can claim partial to all of their reward if there is any. Users can also withdraw all their staking along with their reward at once. Also, staking more to the staking contract is also valid as long as the total deposit is still in range of any *level*.
The relative methods are `deposit`, `claim`, and `exit`.

## Function Description


- onlyGovernance

Modifier that accepts only transactions from the assigned governance.

</br>

- inWhitelist

Modifier that accepts only transactions from addresses in any added whitelist.

</br>

- addWhitelist **onlyGovernance**

Adds a whitelist to the staking contract.

</br>

- removeWhitelist **onlyGovernance**

Removes a whitelist from the staking contract.

</br>

- getAllTokens

Gets all NFT tokenIds a owner has in all the added whitelists.

Every heading number in the returned list indicates the number of following numbers are tokenId in a added whitelist.

</br>

- setPendingGovernance **onlyGovernance**

Sets the pending governance. The governance changes after `acceptPendingGovernance` being called by the set pending governance.

</br>

- acceptGovernance

This method can only be called by the pending governance set by the function, `setPendingGovernance`. The caller becomes the governance.

</br>

- isUsing

Returns true if the owner of the NFT has staking in the staking contract which is only relying on that NFT.

</br>

- updatePeriod **onlyGovernance**

Updates the period time per period in block time unit.

</br>

- setPeriodThreshold **onlyGovernance**

Sets the periodThreshold, the number of periods users have to wait after their first deposit.

</br>

- setRewardingAddress **onlyGovernance**

Sets the address that transfers the reward to rewarded users.

</br>

- addLevel **onlyGovernance**

Adds a level defining the reward per period for range of stakings.

</br>

- deposit

This method can only be called by users having at least one NFT in any added whitelists. It stakes an amount to the staking contract. The transaction would fail if the staking is out of range of any level.

</br>

- claim

This method can only be called by users having at least one NFT in any added whitelists. It transfers an amount from the accumulated reward to the user. If the claiming amount exceeded total reward the user has, claim all the reward.

</br>

- exit

This method can only be called by users having at least one NFT in any added whitelists. It transfers all the remaining reward all the staked tokens back to the user. The accumulated periods of the stake is reset as well.

</br>

- getPeriodCount

Gets the number of periods udpated before.

</br>

- getPeriod

Gets the period in block time unit.

</br>

- getPeriodThreshold

Gets the number of periods required after user deposit before users can claim their reward.

</br>

- getRewardingAddress

Gets the address which transfers user reward to users.

</br>

- getLevelCount

Gets the number of levels updated before.

</br>

- getLevel

Getes details of the level including interest, upper bound, lower bound, and the period when the level is set.

</br>

- canClaim

Returns true if the user can claim any reward.

</br>

- getPoolToken

Gets the ERC20 token address of the staking pool.

</br>

- getPoolTotalDeposited

Gets the total deposited amount from all users.

</br>

- getStakeTotalDeposited

Gets the amount deposited from the user.

</br>

- getStakeInfo

Gets details of staking from the user including total deposits, accumulated reward, last internal update to the stake, and the period of the first deposit from the user. The period of the first deposit from the user resets everytime when `exit` is called.

</br>
