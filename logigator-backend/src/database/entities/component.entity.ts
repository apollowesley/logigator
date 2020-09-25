import {
	BeforeRemove,
	Column,
	CreateDateColumn,
	Entity, Generated, getCustomRepository, JoinColumn,
	ManyToOne,
	OneToMany, OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn, VersionColumn
} from 'typeorm';
import {User} from './user.entity';
import {ComponentFile} from './component-file.entity';
import {ComponentFileRepository} from '../repositories/component-file.repository';


@Entity()
export class Component {

	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column({length: 2048, default: ''})
	description: string;

	@CreateDateColumn()
	createdOn: Date;

	@UpdateDateColumn()
	lastEdited: Date;

	@OneToOne(type => ComponentFile, componentFile => componentFile.component, {cascade: true, eager: true})
	@JoinColumn()
	componentFile: ComponentFile;

	@Column()
	symbol: string;

	@Column()
	numInputs: number;

	@Column()
	numOutputs: number;

	@Column('simple-array')
	labels: string[];

	@ManyToOne(type => User, object => object.components)
	user: Promise<User>;

	@Column({nullable: false})
	@Generated('uuid')
	link: string;

	@Column({default: false, nullable: false})
	public: boolean;

	@ManyToOne(type => Component, object => object.forks, {nullable: true})
	forkedFrom: Promise<Component>;

	@OneToMany(type => Component, object => object.forkedFrom)
	forks: Promise<Component[]>;

	@VersionColumn()
	version: number;

	@BeforeRemove()
	private async removeFile() {
		if (this.componentFile)
			await getCustomRepository(ComponentFileRepository).remove(this.componentFile);
	}
}
