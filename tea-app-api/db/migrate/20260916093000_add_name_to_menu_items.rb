class AddNameToMenuItems < ActiveRecord::Migration[8.1]
  def change
    add_column :menu_items, :name, :string
  end
end
