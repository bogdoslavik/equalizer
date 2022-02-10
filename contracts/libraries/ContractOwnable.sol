// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract ContractOwnable is Context {
    address private _contractOwner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function getOwner() public view virtual returns (address) {
        return _contractOwner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(getOwner() == _msgSender() || getOwner() == address(0), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
//    function renounceOwnership() public virtual onlyOwner {
//        _setOwner(address(0));
//    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferContractOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _contractOwner;
        _contractOwner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /// @dev for proxy / initializer
    function initOwner(address newOwner) public {
        if (_contractOwner != address(0)) return;
        _contractOwner = newOwner;
        emit OwnershipTransferred(address(0), newOwner);
    }

    // ************* VIEWS FOR BACKEND DATA LOADING *************

    function loadPairsUniswapV2(address factoryAddress, uint256 skip, uint256 count )
    external view returns (LpData[] memory pairs) {
        console.log('loadPairsUniswapV2');
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        uint256 allPairsLength = factory.allPairsLength();
        uint256 maxPair = Math.min(allPairsLength, skip + count);
        pairs = new LpData[](maxPair - skip);

        uint256 b = 0;
        for (uint p = skip; p < maxPair; p++) {
            address pairAddress = factory.allPairs(p);
            console.log('pairAddress', pairAddress);
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);

            address token0 = pair.token0(); // TODO try
            address token1 = pair.token1(); // TODO try

            pairs[b++] = LpData({lp:pairAddress, token0:token0, token1: token1});
        }
    }

    function loadPairReserves(address[] memory pairs)
    external view returns (ReservesData[] memory reserves) {
        uint256 len = pairs.length;
        reserves = new ReservesData[](len);

        for (uint i = 0; i < len; i++) {
            address pairAddress = pairs[i];
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
            try pair.getReserves() returns (uint112 reserve0, uint112 reserve1, uint32) {
                reserves[i] = ReservesData({reserve0:reserve0, reserve1:reserve1});
            } catch (bytes memory) { // any error interpret as nil reserves
                reserves[i] = ReservesData({reserve0:0, reserve1:0});
            }
        }
    }

    function loadTokenNames(address[] memory tokens)
    external view returns (string[] memory names) {
        uint256 len = tokens.length;
        names = new string[](len);

        for (uint i = 0; i < len; i++) {
            try IERC20Name(tokens[i]).symbol() returns (string name) {
                names[i] = name;
            } catch (bytes memory /*lowLevelData*/) {
            }
        }
    }

    function getTokenBalances(address[] memory tokens)
    external view returns (uint256[] memory balances) {
        uint256 len = tokens.length;
        balances = new uint256[](len);

        for (uint i = 0; i < len; i++) {
            try IERC20(tokens[i]).balanceOf(address(this)) returns (uint256 balance) {
                balances[i] = balance;
            } catch (bytes memory /*lowLevelData*/) {
            }
        }
    }


    // ********************* OWNER ACTIONS **********************

    function withdraw(address token, uint256 amount) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (amount == 0) amount = balance;
        if (balance >= amount) {
            IERC20(token).transfer(getOwner(), amount);
        } else {
            IERC20(token).transfer(getOwner(), balance);
        }
    }


}
