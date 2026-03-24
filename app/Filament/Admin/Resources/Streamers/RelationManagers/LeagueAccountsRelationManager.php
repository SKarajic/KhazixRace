<?php

namespace App\Filament\Admin\Resources\Streamers\RelationManagers;

use App\Filament\Admin\Resources\LeagueAccounts\LeagueAccountResource;
use App\Models\LeagueAccount;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Validation\ValidationException;
use Phizz\Enums\Platform;
use Phizz\Enums\Regional;
use Phizz\Facades\Phizz;
use Throwable;

class LeagueAccountsRelationManager extends RelationManager
{
    /**
     * The Eloquent relationship name on the owner model.
     */
    protected static string $relationship = 'leagueAccounts';

    /**
     * Configure the form schema used when editing a league account inline.
     */
    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Account Details')
                    ->columns(2)
                    ->schema([
                        TextInput::make('game_name')
                            ->label('Game Name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpan(1),

                        TextInput::make('tag_line')
                            ->label('Tag Line')
                            ->required()
                            ->maxLength(255)
                            ->prefix('#')
                            ->columnSpan(1),

                        Select::make('platform')
                            ->label('Server / Platform')
                            ->options(
                                collect(Platform::cases())
                                    ->mapWithKeys(fn (Platform $p) => [$p->value => $p->name])
                                    ->toArray()
                            )
                            ->required()
                            ->columnSpan(1),

                        Toggle::make('is_primary')
                            ->label('Primary account')
                            ->columnSpan(1),
                    ]),
            ]);
    }

    /**
     * Configure the league accounts table with create, edit, set-primary, and delete actions.
     */
    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('game_name')
            ->columns([
                TextColumn::make('game_name')
                    ->label('Riot ID')
                    ->formatStateUsing(fn ($state, LeagueAccount $record) => "{$record->game_name}#{$record->tag_line}")
                    ->searchable(),

                TextColumn::make('platform')
                    ->badge()
                    ->formatStateUsing(fn ($state) => Platform::from($state)->name),

                TextColumn::make('puuid')
                    ->label('PUUID')
                    ->limit(20)
                    ->placeholder('Not resolved')
                    ->tooltip(fn ($state) => $state),

                IconColumn::make('is_primary')
                    ->label('Primary')
                    ->boolean(),
            ])
            ->recordUrl(fn (LeagueAccount $record) => LeagueAccountResource::getUrl('view', ['record' => $record]))
            ->filters([])
            ->headerActions([
                CreateAction::make()
                    ->label('Add Account')
                    ->form([
                        TextInput::make('riot_id')
                            ->label('Riot ID')
                            ->placeholder('IAmTheWhite#EUW')
                            ->helperText('Format: GameName#TagLine')
                            ->required(),
                        Select::make('platform')
                            ->label('Server / Platform')
                            ->options(
                                collect(Platform::cases())
                                    ->mapWithKeys(fn (Platform $p) => [$p->value => $p->name])
                                    ->toArray()
                            )
                            ->required(),
                    ])
                    ->using(function (array $data, RelationManager $livewire): LeagueAccount {
                        if (! str_contains($data['riot_id'], '#')) {
                            throw ValidationException::withMessages([
                                'riot_id' => 'Riot ID must be in the format GameName#TagLine.',
                            ]);
                        }

                        [$gameName, $tagLine] = explode('#', $data['riot_id'], 2);

                        $puuid = null;
                        $skipRegionals = [Regional::Esports, Regional::EsportsEU, Regional::APAC];

                        foreach (Regional::cases() as $regional) {
                            if (in_array($regional, $skipRegionals)) {
                                continue;
                            }

                            try {
                                $account = Phizz::riot()->accountV1->getByRiotId(
                                    tagLine: $tagLine,
                                    gameName: $gameName,
                                    platform: $regional,
                                    force: true,
                                );

                                if (! empty($account->puuid)) {
                                    $puuid = $account->puuid;
                                    break;
                                }
                            } catch (Throwable) {
                                continue;
                            }
                        }

                        if (! $puuid) {
                            throw ValidationException::withMessages([
                                'riot_id' => "Account \"{$data['riot_id']}\" was not found on any region.",
                            ]);
                        }

                        return $livewire->getOwnerRecord()->leagueAccounts()->create([
                            'game_name' => $gameName,
                            'tag_line' => $tagLine,
                            'puuid' => $puuid,
                            'platform' => $data['platform'],
                        ]);
                    }),
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('setPrimary')
                    ->label('Set as Primary')
                    ->icon('heroicon-o-star')
                    ->hidden(fn (LeagueAccount $record) => $record->is_primary)
                    ->action(fn (LeagueAccount $record) => $record->update(['is_primary' => true]))
                    ->after(fn () => Notification::make()->title('Primary account updated')->success()->send()),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
