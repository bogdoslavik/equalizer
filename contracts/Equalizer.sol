//SPDX-License-Identifier: PRIVATE
pragma solidity 0.8.4;
pragma abicoder v2;

import '@openzeppelin/contracts/proxy/utils/Initializable.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './libraries/ContractOwnable.sol';
import './libraries/Math.sol';
import "./interfaces/uniswap/IUniswapV2Factory.sol";
import "./interfaces/uniswap/IUniswapV2Pair.sol";
import "./interfaces/uniswap/IUniswapV2Router02.sol";
import "./interfaces/IERC20Name.sol";

import "hardhat/console.sol";

contract Equalizer is ContractOwnable, Initializable {

    struct LpData {
        address lp;
        address token0;
        address token1;
    }

    struct ReservesData {
        uint256 reserve0;
        uint256 reserve1;
    }

    struct TokenData {
        address token;
        string symbol;
    }

    address public networkToken;

    constructor(address _networkToken) {
        initialize(_networkToken);
    }

    function initialize(address _networkToken)
    public initializer {
        if (getOwner() != address(0)) return;
        initOwner(_msgSender());
        networkToken = _networkToken;
    }

    // ************* VIEWS FOR BACKEND DATA LOADING *************

    function loadPairsUniswapV2(address factoryAddress, uint256 skip, uint256 count )
    external view returns (LpData[] memory pairs) {
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        uint256 allPairsLength = factory.allPairsLength();
        uint256 maxPair = Math.min(allPairsLength, skip + count);
        pairs = new LpData[](maxPair - skip);

        uint256 b = 0;
        for (uint p = skip; p < maxPair; p++) {
            address pairAddress = factory.allPairs(p);
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);

            address token0 = address(0);
            address token1 = address(0);

            try pair.token0() returns (address token) {
                token0 = token;
            } catch (bytes memory) {}

            try pair.token1() returns (address token) {
                token1 = token;
            } catch (bytes memory) {}

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
            try IERC20Name(tokens[i]).symbol() returns (string memory name) {
                names[i] = name;
            } catch (bytes memory /*lowLevelData*/) {
                names[i] = '';
            }
        }
    }

    function getTokenBalances(address[] memory tokens, address holder)
    external view returns (uint256[] memory balances) {
        uint256 len = tokens.length;
        balances = new uint256[](len);

        for (uint i = 0; i < len; i++) {
            try IERC20(tokens[i]).balanceOf(holder) returns (uint256 balance) {
                balances[i] = balance;
            } catch (bytes memory /*lowLevelData*/) {
                balances[i] = 0;
            }
        }
    }

    // ********************* ACTIONS ****************************


    // ********************* OWNER ACTIONS **********************

    function exchange(address lp, address tokenIn, uint256 amountIn)
    external onlyOwner {
        revert('EQ: Not implemented');
        // TODO
        // transfer to pair
        // get reserves
        // calc amounts
        // swap
    }
    function withdraw(address token, uint256 amount)
    external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (amount == 0) amount = balance;
        if (balance >= amount) {
            IERC20(token).transfer(getOwner(), amount);
        } else {
            IERC20(token).transfer(getOwner(), balance);
        }
    }

}
