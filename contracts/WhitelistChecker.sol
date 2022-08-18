// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import {Whitelist} from "./Whitelist.sol";
import {IWhitelistChecker} from "./interfaces/IWhitelistChecker.sol";

contract WhitelistChecker is IWhitelistChecker {
    event WhitelistAdded(Whitelist _whitelist);

    event WhitelistRemoved(Whitelist _whitelist);

    Whitelist[] public whitelist;

    mapping(Whitelist => uint256) whitelistIndex;

    modifier onlyGovernance() virtual {_;}

    modifier inWhitelist() virtual {
        require(whitelist.length > 0, "StakingPools: whitelist not set");
        bool _inList;
        for (uint256 i = 0; i < whitelist.length; i++) {
            if (whitelist[i].includeOwner(msg.sender)) {
                _inList = true;
                break;
            }
        }
        require(_inList, "StakingPools: owner not in any white lists");
        _;
    }

    /// @dev Add a whitelist to staking contract
    ///
    /// @param _whitelist the address of the whitelist contract
    function addWhitelist(Whitelist _whitelist)
        external
        virtual
        override
        onlyGovernance
    {
        require(
            address(_whitelist) != address(0),
            "StakingPools: whitelist cannot be 0x0"
        );
        require(
            whitelistIndex[_whitelist] == 0,
            "StakingPools: the whitelist already added"
        );
        _whitelist.addChecker(IWhitelistChecker(address(this)));
        whitelist.push(_whitelist);
        whitelistIndex[_whitelist] = whitelist.length;

        emit WhitelistAdded(_whitelist);
    }

    function removeWhitelist(Whitelist _whitelist)
        external
        virtual
        override
        onlyGovernance
    {
        require(
            whitelistIndex[_whitelist] != 0,
            "StakingPools: the whitelist doesn't exist"
        );
        _whitelist.removeChecker(IWhitelistChecker(address(this)));
        uint256 _whitelistPtr = whitelistIndex[_whitelist];
        if (_whitelistPtr != whitelist.length) {
            whitelist[_whitelistPtr - 1] = whitelist[whitelist.length - 1];
            whitelistIndex[whitelist[whitelist.length - 1]] = _whitelistPtr;
        }
        whitelistIndex[_whitelist] = 0;
        whitelist.pop();

        emit WhitelistRemoved(_whitelist);
    }

    function getAllTokens(address _owner)
        external
        view
        virtual
        override
        returns (uint256[] memory)
    {
        uint256 _balance = 0;
        for (uint256 i = 0; i < whitelist.length; i++) {
            _balance += whitelist[i].balanceOf(_owner);
        }
        uint256[] memory _ret = new uint256[](_balance + whitelist.length);
        uint256 _ptr = 0;
        for (uint256 i = 0; i < whitelist.length; i++) {
            _ret[_ptr] = whitelist[i].balanceOf(_owner);
            _ptr++;
            uint256[] memory _tmp = whitelist[i].listTokens(_owner);
            for (uint256 j = 0; j < _tmp.length; j++) {
                _ret[_ptr] = _tmp[j];
                _ptr++;
            }
        }
        return _ret;
    }

    function isUsing(
        Whitelist _whitelist,
        address _owner,
        uint256 _tokenId
    ) external view virtual override returns (bool) {}
}
