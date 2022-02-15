module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('Equalizer', {
        from: deployer,
        args: [],
        log: true,
        proxy: {
            methodName: 'initialize',
        },
        log: true,
    });
};
module.exports.tags = ['Equalizer'];
