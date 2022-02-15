module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('Skimmer', {
        from: deployer,
        args: [],
        // proxy: {
        //     methodName: 'initialize',
        // },
        log: true,
    });
};
module.exports.tags = ['Skimmer'];
