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

    struct SkimData {
        address lp;
        address token0;
        address token1;
        uint cream0;
        uint cream1;
    }

    struct LpData {
        address lp;
        address token0;
        address token1;
    }

    struct ReservesData {
        uint reserve0;
        uint reserve1;
    }

    struct TokenData {
        address token;
        string symbol;
    }

    address public networkToken;

    constructor() {
        initialize();
    }

    function initialize()
    public initializer {
        if (getOwner() != address(0)) return;
        initOwner(_msgSender());
    }

    // ************* VIEWS FOR BACKEND DATA LOADING *************

    function allPairsLengthUniswapV2(address factoryAddress)
    external view returns (uint allPairsLength) {
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        allPairsLength = factory.allPairsLength();
    }

    function scanSkimsUniswapV2(address factoryAddress, uint skip, uint count )
    external view returns (SkimData[] memory foundPairs) {
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        uint allPairsLength = factory.allPairsLength();
        uint maxPair = Math.min(allPairsLength, skip + count);
        SkimData[] memory pairs = new SkimData[](maxPair - skip);

        uint b = 0;
        for (uint p = skip; p < maxPair; p++) {
            IUniswapV2Pair pair = IUniswapV2Pair(factory.allPairs(p));
            address token0 = address(0);
            address token1 = address(0);

            try pair.token0() returns (address token) {
                token0 = token;
            } catch (bytes memory) { continue; }

            try pair.token1() returns (address token) {
                token1 = token;
            } catch (bytes memory) { continue; }

            uint reserve0 = 0;
            uint reserve1 = 0;

            try pair.getReserves() returns (uint112 _reserve0, uint112 _reserve1, uint32) {
                reserve0 = _reserve0;
                reserve1 = _reserve1;
            } catch (bytes memory) { continue; }

            uint balance0 = 0;
            uint balance1 = 0;

            try IERC20(token1).balanceOf(address(this)) returns (uint balance) {
                balance0 = balance;
            } catch (bytes memory) { continue; }


            try IERC20(token1).balanceOf(address(this)) returns (uint balance) {
                balance1 = balance;
            } catch (bytes memory) { continue; }

            uint cream0 = balance0 > reserve0 ? balance0 - reserve0 : 0;
            uint cream1 = balance1 > reserve1 ? balance1 - reserve1 : 0;

            if (cream0 == 0 && cream1 == 0) {
                continue;
            }

            pairs[b++] = SkimData({
                lp:address(pair),
                token0: token0,
                token1: token1,
                cream0: cream0,
                cream1: cream1
            });
        }
        foundPairs = new SkimData[](b);
        for (uint i = 0; i < b; i++)
            foundPairs[i] = pairs[i];
    }

    function loadPairsUniswapV2(address factoryAddress, uint skip, uint count )
    external view returns (LpData[] memory pairs) {
        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        uint allPairsLength = factory.allPairsLength();
        uint maxPair = Math.min(allPairsLength, skip + count);
        pairs = new LpData[](maxPair - skip);

        uint b = 0;
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
        uint len = pairs.length;
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
        uint len = tokens.length;
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
    external view returns (uint[] memory balances) {
        uint len = tokens.length;
        balances = new uint[](len);

        for (uint i = 0; i < len; i++) {
            try IERC20(tokens[i]).balanceOf(holder) returns (uint balance) {
                balances[i] = balance;
            } catch (bytes memory /*lowLevelData*/) {
                balances[i] = 0;
            }
        }
    }

    // ********************* ACTIONS ****************************


    // ********************* OWNER ACTIONS **********************

    function exchange(address lp, address tokenIn, uint amountIn)
    external onlyOwner {
        revert('EQ: Not implemented');
        // TODO
        // transfer to pair
        // get reserves
        // calc amounts
        // swap
    }

    function setNetworkToken(address _networkToken)
    external onlyOwner {
        require(_networkToken != address(0), 'EQ: Network token can not be 0');
        networkToken = _networkToken;

    }

    function withdraw(address token, uint amount)
    external onlyOwner {
        uint balance = IERC20(token).balanceOf(address(this));
        if (amount == 0) amount = balance;
        if (balance >= amount) {
            IERC20(token).transfer(getOwner(), amount);
        } else {
            IERC20(token).transfer(getOwner(), balance);
        }
    }

}
