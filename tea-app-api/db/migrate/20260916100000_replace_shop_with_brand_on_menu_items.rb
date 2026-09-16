class ReplaceShopWithBrandOnMenuItems < ActiveRecord::Migration[8.1]
  def change
    add_reference :menu_items, :brand, null: false, foreign_key: true
    remove_reference :menu_items, :shop, null: false, foreign_key: true
  end
end
