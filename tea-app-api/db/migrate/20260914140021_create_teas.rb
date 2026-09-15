class CreateTeas < ActiveRecord::Migration[8.1]
  def change
    create_table :teas do |t|
      t.string :name_en
      t.string :category, array:true, default: []
      t.string :flavor_primary

      t.timestamps
    end
  end
end
