// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error DOMAIN_NotTheOwner(address caller, address owner);
error ID_Zero_Not_Defined();
error ID_Greater_than_supply();
error Domain_Already_Owned();
error More_ETH_Needed_Cost_not_satisfied();

contract Domain is ERC721 {
    address private immutable i_owner;
    uint256 public supply  ;
    uint256 private mintedSupply ;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        i_owner = msg.sender;
    }

    struct id {
        string name;
        uint256 cost;
        bool isOwned;
    }

    mapping(uint256 => id) id_arr;

    /* MODIFIERS*/
    modifier  onlyOwner() {
        if(msg.sender != i_owner){
            revert DOMAIN_NotTheOwner( msg.sender,  i_owner);
        }
        _;
    }

    modifier mintPossible( uint256 _id){
        if(_id == 0 ){
            revert ID_Zero_Not_Defined();
        }
        if(_id > supply) revert ID_Greater_than_supply();
        if(id_arr[_id].isOwned == true ) revert Domain_Already_Owned();
        if(msg.value < id_arr[_id].cost) revert More_ETH_Needed_Cost_not_satisfied();
        _;
    }


    /* Function */
    function list(string memory name, uint256 cost) external onlyOwner {
        supply++;
        id_arr[supply] = id(name, cost, false);
    }

    /**
     * @dev this mint function mints the nft using the _safemint function from openzeppllin contracts
     */

    function mint(uint256 _id) external payable mintPossible(_id){
        id_arr[_id].isOwned = true;
        mintedSupply ++;
        _safeMint(msg.sender,_id);
    }

    /**
     * @dev this withdraw function returns the profits to the owner when called
     */

    function withdraw() external onlyOwner{
        (bool success, ) = i_owner.call{ value: address(this).balance}("");
        require(success);
    }


    /* VIEW / PURE FUNCTIONS */
    function getowner() external view returns (address) {
        return i_owner;
    }

    function getSupply() external view returns (uint256) {
        return supply;
    }

    function getname(uint256 i) external view returns(string memory){
        return id_arr[i].name;
    }
    function getcost(uint256 i) external view returns(uint256){
        return id_arr[i].cost;
    }

    function getid(uint256 i) external view returns (id memory){
        return id_arr[i];
    }

    function getBalance() external view returns (uint256){
        return address(this).balance ;
    }
    function getMintedSupply() external view returns(uint256){
        return mintedSupply;
    }
}
