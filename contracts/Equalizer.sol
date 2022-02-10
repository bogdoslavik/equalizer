//SPDX-License-Identifier: PRIVATE
pragma solidity 0.8.4;
pragma abicoder v2;

import '@openzeppelin/contracts/proxy/utils/Initializable.sol';
import './libraries/ContractOwnable.sol';

contract Equalizer is ContractOwnable, Initializable {
    address public networkToken;

    constructor(address _networkToken) {
        initialize(_networkToken);
    }

    function initialize(address _networkToken) public {
        if (getOwner() != address(0)) return;
        initOwner(_msgSender());
        networkToken = _networkToken;
    }

}
