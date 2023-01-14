const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "ETH DOMS";
const SYMBOL = "DOMS";
const DOM1_NAME = "harshit0verma.eth";
const DOM1_COST = 10;

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("ETH _DOMS", async () => {
  let CONTRACT;
  let contract;
  let deployer, owner1;
  beforeEach(async () => {
    [deployer, owner1] = await ethers.getSigners();
    // console.log(deployer);
    CONTRACT = await ethers.getContractFactory("Domain");
    contract = await CONTRACT.deploy(NAME, SYMBOL);
    let tx = await contract
      .connect(deployer)
      .list(DOM1_NAME, tokens(DOM1_COST));
    await tx.wait();
  });

  describe("Deployments", () => {
    it("has a name ", async () => {
      const check = await contract.name();

      expect(check).to.equal(NAME);
    });
    it("has a symbol", async () => {
      let check = await contract.symbol();
      expect(check).to.equal(SYMBOL);
    });

    it("SET the owner", async () => {
      let check = await contract.getowner();
      expect(check).to.equal(deployer.address);
    });

    it("set supply", async ()=>{
      let check = await contract.getSupply();
      expect(check).to.equal(1);
    })
  });


  describe("Listing", () => {
    it("Listing name", async () => {
      let check = await contract.getname(1);

      expect(check).to.equal(DOM1_NAME);
    });
    it("Listing cost", async () => {
      let check = await contract.getcost(1);
      expect(check).to.equal(tokens(DOM1_COST));
    });

    it("checking name and cost using getter func for struct ",async()=>{
      let check = await contract.getid(1);
      expect(check.name).to.equal(DOM1_NAME);
      expect(check.cost).to.equal(tokens(DOM1_COST));
    })
  });


  describe("Minting",()=>{
    let ID = 1;
    const AMOUNT = ethers.utils.parseUnits("10","ether");

    beforeEach (async ()=>{
      const transaction = await contract.connect(owner1).mint(ID,{value: AMOUNT});
      await transaction.wait();
    });

    it("updates the owner",async()=>{
      const owner = await contract.ownerOf(ID);
      expect(owner).to.be.equal(owner1.address);
    });

    it("update the balance", async ()=>{
      const balance = await contract.getBalance();
      expect(balance).to.equal(AMOUNT);
    });
    it("update the id status", async ()=>{
      const check = await contract.getid(1);

      expect(check.isOwned).to.equal(true);
    });
    it("update total supply", async ()=>{
      const check = await contract.getMintedSupply();
      expect(check).to.equal(1);
    });
    
  })


  describe("Withdraw", async()=>{


    let ID = 1;
    const AMOUNT = ethers.utils.parseUnits("10","ether");
    let balance_before;

    beforeEach (async ()=>{
      balance_before = await ethers.provider.getBalance(deployer.address);
      const transaction = await contract.connect(owner1).mint(ID,{value: AMOUNT});
      await transaction.wait();
      const wd = await contract.connect(deployer).withdraw();
      await wd.wait();
    });

    it("Withdrawing from the contract", async()=>{

      const balance_after = await ethers.provider.getBalance(deployer.address);
      expect(balance_after).to.be.greaterThan(balance_before);
      
    })

    it("checking zero balance in contract",async()=>{
      const check = await contract.getBalance();
      expect(check).to.equal(0);
    })
  })
});
