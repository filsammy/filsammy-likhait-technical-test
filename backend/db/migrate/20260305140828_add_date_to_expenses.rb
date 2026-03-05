class AddDateToExpenses < ActiveRecord::Migration[7.2]
  def change
    # Add column allowing NULLs temporarily
    add_column :expenses, :date, :date

    # Backfill existing records using the date from created_at
    # This ensures 4,000+ existing expenses don't have "0000-00-00"
    reversible do |dir|
      dir.up do
        execute "UPDATE expenses SET date = DATE(created_at)"
      end
    end

    # Now that every row has a date, we can safely enforce NOT NULL
    change_column_null :expenses, :date, false
  end
end