exports.getConfig = async (req, res) => {
  const { chainId } = req.params;

  res.status(200).json({
    blah: true,
  });
};
